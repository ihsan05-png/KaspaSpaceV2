<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class FnbItem extends Model {
    protected $fillable = ['name','category','price','unit','packages','images','location','description','status','sort_order'];
    protected $appends  = ['image'];
    protected function casts(): array {
        return ['price' => 'integer','sort_order' => 'integer','packages' => 'array','images' => 'array'];
    }
    public function getImageAttribute(): ?string {
        return $this->images[0] ?? null;
    }
}
