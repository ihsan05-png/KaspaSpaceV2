<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OvertimeSchedule extends Model {
    protected $fillable = ['room_id','day_of_week','start_time','end_time','active'];
    protected function casts(): array { return ['day_of_week' => 'integer','active' => 'boolean']; }
    public function room(): BelongsTo { return $this->belongsTo(Room::class); }
}
