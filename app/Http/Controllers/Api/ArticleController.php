<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Article;

class ArticleController extends Controller {
    public function index() {
        return response()->json(
            Article::where('status', 'published')
                ->orderByDesc('published_at')
                ->get(['id','slug','title','excerpt','category','author_name','author_role','image_url','read_time','featured','published_at'])
        );
    }

    public function show(string $slug) {
        $article = Article::where('slug', $slug)->where('status', 'published')->firstOrFail();
        return response()->json($article);
    }
}
