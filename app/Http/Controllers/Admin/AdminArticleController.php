<?php
namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminArticleController extends Controller {
    public function index() {
        return response()->json(Article::orderByDesc('created_at')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'title'       => 'required|string|max:255',
            'excerpt'     => 'required|string|max:500',
            'body'        => 'nullable|array',
            'category'    => 'required|string|max:60',
            'author_name' => 'required|string|max:100',
            'author_role' => 'nullable|string|max:80',
            'image_url'   => 'nullable|url|max:500',
            'read_time'   => 'nullable|string|max:20',
            'featured'    => 'boolean',
            'status'      => 'required|in:draft,published',
            'sort_order'  => 'integer',
        ]);

        $data['slug'] = Str::slug($data['title']) . '-' . Str::random(5);
        if (!empty($data['featured'])) {
            Article::where('featured', true)->update(['featured' => false]);
        }
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return response()->json(Article::create($data), 201);
    }

    public function update(Request $request, Article $article) {
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'excerpt'     => 'sometimes|string|max:500',
            'body'        => 'nullable|array',
            'category'    => 'sometimes|string|max:60',
            'author_name' => 'sometimes|string|max:100',
            'author_role' => 'nullable|string|max:80',
            'image_url'   => 'nullable|url|max:500',
            'read_time'   => 'nullable|string|max:20',
            'featured'    => 'boolean',
            'status'      => 'sometimes|in:draft,published',
            'sort_order'  => 'integer',
        ]);

        if (!empty($data['featured'])) {
            Article::where('featured', true)->where('id', '!=', $article->id)->update(['featured' => false]);
        }
        if (isset($data['status']) && $data['status'] === 'published' && !$article->published_at) {
            $data['published_at'] = now();
        }

        $article->update($data);
        return response()->json($article);
    }

    public function destroy(Article $article) {
        $article->delete();
        return response()->json(null, 204);
    }
}
