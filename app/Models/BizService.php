<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class BizService extends Model {
    protected $fillable = ['name','category','description','photos','price','packages','location','duration','requires_documents','status','sort_order'];
    protected $appends  = ['photo'];
    protected function casts(): array {
        return [
            'price' => 'integer', 'sort_order' => 'integer',
            'packages' => 'array', 'photos' => 'array',
            'requires_documents' => 'boolean',
        ];
    }
    public function getPhotoAttribute(): ?string {
        return $this->photos[0] ?? null;
    }
}
