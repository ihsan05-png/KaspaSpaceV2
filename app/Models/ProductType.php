<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ProductType extends Model {
    protected $fillable = ['key','name','description','unit','images','amenity','suggested_price','prices','location','badge','no_room','requires_documents','sort_order','status'];
    protected $appends  = ['image'];
    protected function casts(): array {
        return [
            'no_room' => 'boolean', 'requires_documents' => 'boolean',
            'suggested_price' => 'integer', 'sort_order' => 'integer',
            'prices' => 'array', 'images' => 'array',
        ];
    }
    public function getImageAttribute(): ?string {
        return $this->images[0] ?? null;
    }
    public function rooms(): BelongsToMany { return $this->belongsToMany(Room::class, 'room_product_type'); }
}
