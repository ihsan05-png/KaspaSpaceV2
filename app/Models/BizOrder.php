<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BizOrder extends Model {
    protected $fillable = [
        'code','user_id','biz_service_id','member_name','member_email','member_phone',
        'package_name','price','discount_code','discount_amount','status','note','documents',
    ];
    protected function casts(): array {
        return ['price' => 'integer', 'discount_amount' => 'integer', 'documents' => 'array'];
    }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function service(): BelongsTo { return $this->belongsTo(BizService::class, 'biz_service_id'); }
}
