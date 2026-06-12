<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductType;
use Illuminate\Http\Request;

class AdminProductTypeController extends Controller
{
    public function index()
    {
        return response()->json(ProductType::orderBy('sort_order')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'key'               => 'required|string|unique:product_types,key|max:50',
            'name'              => 'required|string|max:100',
            'description'       => 'nullable|string',
            'unit'              => 'required|string|max:20',
            'images'            => 'nullable|array',
            'images.*'          => 'nullable|url',
            'capacity'          => 'nullable|string|max:50',
            'amenity'           => 'nullable|string|max:100',
            'suggested_price'   => 'integer|min:0',
            'prices'            => 'nullable|array',
            'prices.*.label'            => 'nullable|string|max:50',
            'prices.*.price'            => 'required|integer|min:0',
            'prices.*.unit'             => 'required|string|max:20',
            'prices.*.booking_type'     => 'nullable|string|max:50',
            'prices.*.duration_months'  => 'nullable|integer|min:1|max:120',
            'badge'                     => 'nullable|string|max:50',
            'location'                  => 'nullable|string|max:100',
            'requires_documents'        => 'boolean',
            'sort_order'                => 'integer|min:0',
            'status'                    => 'in:active,draft',
        ]);

        $data = $this->derivePrimaryPrice($data);

        return response()->json(ProductType::create($data), 201);
    }

    public function update(Request $request, ProductType $productType)
    {
        $data = $request->validate([
            'key'               => 'sometimes|string|max:50|unique:product_types,key,' . $productType->id,
            'name'              => 'sometimes|string|max:100',
            'description'       => 'nullable|string',
            'unit'              => 'sometimes|string|max:20',
            'images'            => 'nullable|array',
            'images.*'          => 'nullable|url',
            'amenity'           => 'nullable|string|max:100',
            'suggested_price'   => 'integer|min:0',
            'prices'            => 'nullable|array',
            'prices.*.label'            => 'nullable|string|max:50',
            'prices.*.price'            => 'required|integer|min:0',
            'prices.*.unit'             => 'required|string|max:20',
            'prices.*.booking_type'     => 'nullable|string|max:50',
            'prices.*.duration_months'  => 'nullable|integer|min:1|max:120',
            'badge'                     => 'nullable|string|max:50',
            'location'                  => 'nullable|string|max:100',
            'requires_documents'        => 'boolean',
            'sort_order'                => 'integer|min:0',
            'status'                    => 'in:active,draft',
        ]);

        $data = $this->derivePrimaryPrice($data);

        $productType->update($data);
        return response()->json($productType->fresh());
    }

    public function destroy(ProductType $productType)
    {
        $productType->delete();
        return response()->json(null, 204);
    }

    /** Auto-set suggested_price & unit dari harga pertama di array prices */
    private function derivePrimaryPrice(array $data): array
    {
        if (!empty($data['prices'])) {
            $first = $data['prices'][0];
            $data['suggested_price'] = $first['price'];
            $data['unit']            = $first['unit'];

            // Auto-derive no_room: true jika SEMUA tier bertipe Virtual Office
            $allVO = collect($data['prices'])->every(
                fn($p) => ($p['booking_type'] ?? '') === 'Virtual Office'
            );
            $data['no_room'] = $allVO;
        }
        return $data;
    }
}
