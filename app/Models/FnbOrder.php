<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};

class FnbOrder extends Model {
    protected $fillable = ['code','user_id','member_name','booking_date','total','status','note'];
    protected function casts(): array { return ['booking_date' => 'date','total' => 'integer']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function items(): HasMany { return $this->hasMany(FnbOrderItem::class); }
}
