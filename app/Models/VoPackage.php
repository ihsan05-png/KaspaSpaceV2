<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class VoPackage extends Model {
    protected $fillable = ['tier','tagline','price','unit','features','popular','sort_order','active'];
    protected function casts(): array { return ['features' => 'array','popular' => 'boolean','active' => 'boolean','price' => 'integer']; }
}
