<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsToMany, HasMany};

class Room extends Model {
    protected $fillable = ['title','location','rating','reviews','price','unit','badge','featured','capacity','amenity','status'];
    protected function casts(): array { return ['rating' => 'float','featured' => 'boolean','reviews' => 'integer','price' => 'integer']; }
    public function productTypes(): BelongsToMany { return $this->belongsToMany(ProductType::class, 'room_product_type'); }
    public function desks(): HasMany { return $this->hasMany(Desk::class); }
    public function bookings(): HasMany { return $this->hasMany(Booking::class); }
    public function overtimeSchedules(): HasMany { return $this->hasMany(OvertimeSchedule::class); }
}
