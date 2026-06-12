<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Article extends Model {
    protected $fillable = [
        'slug','title','excerpt','body','category','author_name','author_role',
        'image_url','read_time','featured','status','published_at','sort_order',
    ];
    protected function casts(): array {
        return [
            'body'         => 'array',
            'featured'     => 'boolean',
            'published_at' => 'datetime',
            'sort_order'   => 'integer',
        ];
    }
}
