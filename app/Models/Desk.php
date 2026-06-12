<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Desk extends Model {
    protected $fillable = ['room_id','number','status'];
    public function room(): BelongsTo { return $this->belongsTo(Room::class); }
}
