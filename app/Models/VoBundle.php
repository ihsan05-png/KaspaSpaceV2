<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class VoBundle extends Model {
    protected $fillable = ['name','price','unit','features','sort_order','active'];
    protected function casts(): array { return ['features' => 'array','active' => 'boolean','price' => 'integer']; }
}
