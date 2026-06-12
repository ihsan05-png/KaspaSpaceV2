<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Discount extends Model {
    protected $fillable = [
        'code','name','description','type','value','min_order','max_discount',
        'quota','used_count','valid_from','valid_until','applicable_to','user_ids',
        'color','status','sort_order',
    ];
    protected function casts(): array {
        return [
            'value'        => 'integer',
            'min_order'    => 'integer',
            'max_discount' => 'integer',
            'quota'        => 'integer',
            'used_count'   => 'integer',
            'sort_order'   => 'integer',
            'valid_from'   => 'date',
            'valid_until'  => 'date',
            'applicable_to'=> 'array',
            'user_ids'     => 'array',
        ];
    }

    public function isAccessibleByUser(?int $userId): bool {
        if (empty($this->user_ids)) return true;
        return $userId !== null && in_array($userId, $this->user_ids);
    }

    public function matchesProduct(string $cat, string|int $productId): bool {
        if (empty($this->applicable_to)) return true;
        foreach ($this->applicable_to as $item) {
            if (($item['cat'] ?? '') === $cat && (string)($item['id'] ?? '') === (string)$productId) {
                return true;
            }
        }
        return false;
    }

    public function isValid(): bool {
        if ($this->status !== 'active') return false;
        if ($this->quota !== null && $this->used_count >= $this->quota) return false;
        $today = now()->startOfDay();
        if ($this->valid_from  && $today->lt($this->valid_from))  return false;
        if ($this->valid_until && $today->gt($this->valid_until)) return false;
        return true;
    }

    public function calculateDiscount(int $subtotal): int {
        if ($subtotal < $this->min_order) return 0;
        if ($this->type === 'percentage') {
            $disc = (int) round($subtotal * $this->value / 100);
            if ($this->max_discount) $disc = min($disc, $this->max_discount);
            return $disc;
        }
        return min($this->value, $subtotal);
    }
}
