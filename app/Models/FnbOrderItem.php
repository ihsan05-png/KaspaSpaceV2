<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FnbOrderItem extends Model {
    protected $fillable = ['fnb_order_id','fnb_item_id','name','qty','price'];
    protected function casts(): array { return ['qty' => 'integer','price' => 'integer']; }
    public function order(): BelongsTo { return $this->belongsTo(FnbOrder::class, 'fnb_order_id'); }
    public function item(): BelongsTo { return $this->belongsTo(FnbItem::class, 'fnb_item_id'); }
}
