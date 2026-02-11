import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const articleId = params.id;
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { category: true, topic: true },
    });

    if (!article) {
      return NextResponse.json({ error: 'מאמר לא נמצא' }, { status: 404 });
    }

    const wpUrl = process.env.WP_URL;
    const wpUser = process.env.WP_USERNAME;
    const wpPass = process.env.WP_APP_PASSWORD;

    if (!wpUrl || !wpUser || !wpPass) {
      return NextResponse.json(
        { error: 'חיבור וורדפרס לא מוגדר. הגדר WP_URL, WP_USERNAME, WP_APP_PASSWORD ב-.env.local' },
        { status: 400 }
      );
    }

    const base64 = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');

    // Find or create WP category
    let wpCategoryId: number | undefined;
    if (article.category) {
      // Search for existing category
      const catRes = await fetch(
        `${wpUrl}/wp-json/wp/v2/categories?search=${encodeURIComponent(article.category.name)}`,
        { headers: { Authorization: `Basic ${base64}` } }
      );
      const cats = await catRes.json();
      if (cats.length > 0) {
        wpCategoryId = cats[0].id;
      } else {
        // Create category
        const newCatRes = await fetch(`${wpUrl}/wp-json/wp/v2/categories`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${base64}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: article.category.name }),
        });
        if (newCatRes.ok) {
          const newCat = await newCatRes.json();
          wpCategoryId = newCat.id;
        }
      }
    }

    // Create WP post as draft
    const postBody: Record<string, unknown> = {
      title: article.title,
      content: article.htmlContent || article.content,
      status: 'draft',
    };

    if (wpCategoryId) {
      postBody.categories = [wpCategoryId];
    }

    // Add keywords as tags
    if (article.keywords && article.keywords.length > 0) {
      const tagIds: number[] = [];
      for (const keyword of article.keywords) {
        const tagRes = await fetch(
          `${wpUrl}/wp-json/wp/v2/tags?search=${encodeURIComponent(keyword)}`,
          { headers: { Authorization: `Basic ${base64}` } }
        );
        const tags = await tagRes.json();
        if (tags.length > 0) {
          tagIds.push(tags[0].id);
        } else {
          const newTagRes = await fetch(`${wpUrl}/wp-json/wp/v2/tags`, {
            method: 'POST',
            headers: {
              Authorization: `Basic ${base64}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: keyword }),
          });
          if (newTagRes.ok) {
            const newTag = await newTagRes.json();
            tagIds.push(newTag.id);
          }
        }
      }
      if (tagIds.length > 0) {
        postBody.tags = tagIds;
      }
    }

    const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${base64}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postBody),
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { error: `שגיאת וורדפרס: ${err.message || res.statusText}` },
        { status: res.status }
      );
    }

    const wpPost = await res.json();

    // Update article with WP info
    await prisma.article.update({
      where: { id: articleId },
      data: {
        wpPostId: String(wpPost.id),
        wpUrl: `${wpUrl}/wp-admin/post.php?post=${wpPost.id}&action=edit`,
        status: 'published',
      },
    });

    return NextResponse.json({
      success: true,
      wpPostId: wpPost.id,
      editUrl: `${wpUrl}/wp-admin/post.php?post=${wpPost.id}&action=edit`,
      previewUrl: wpPost.link,
    });
  } catch (error) {
    console.error('WordPress upload error:', error);
    return NextResponse.json(
      { error: 'שגיאה בהעלאה לוורדפרס' },
      { status: 500 }
    );
  }
}
