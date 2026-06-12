<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model {
    protected $fillable = ['code','invoice_no','user_id','guest_name','guest_email','guest_phone','room_id','product_type_key','booking_date','end_date','start_time','end_time','qty_desks','vo_package_id','vo_bundle_id','total_price','admin_fee','deposit_paid','status','paid_at','notes','documents'];
    protected function casts(): array { return ['booking_date' => 'date','end_date' => 'date','qty_desks' => 'integer','total_price' => 'integer','admin_fee' => 'integer','deposit_paid' => 'integer','paid_at' => 'datetime','documents' => 'array']; }
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
    public function room(): BelongsTo { return $this->belongsTo(Room::class); }
    public function voPackage(): BelongsTo { return $this->belongsTo(VoPackage::class); }
    public function voBundle(): BelongsTo { return $this->belongsTo(VoBundle::class); }
}
