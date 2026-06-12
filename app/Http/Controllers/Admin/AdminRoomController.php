<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{Room, Desk};
use Illuminate\Http\Request;

class AdminRoomController extends Controller
{
    public function index()
    {
        return response()->json(
            Room::with(['productTypes', 'desks'])->orderBy('id')->get()->map(fn($r) => $this->formatRoom($r))
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'            => 'required|string|max:100',
            'location'         => 'required|string|max:100',
            'price'            => 'required|integer|min:0',
            'unit'             => 'required|string|max:20',
            'capacity'         => 'nullable|string|max:50',
            'amenity'          => 'nullable|string|max:100',
            'badge'            => 'nullable|string|max:50',
            'featured'         => 'boolean',
            'status'           => 'in:active,draft,archived',
            'product_type_ids' => 'array',
            'product_type_ids.*' => 'exists:product_types,id',
        ]);

        $room = Room::create($data);

        if (!empty($data['product_type_ids'])) {
            $room->productTypes()->sync($data['product_type_ids']);
        }

        $room->load(['productTypes', 'desks']);
        return response()->json($this->formatRoom($room), 201);
    }

    public function update(Request $request, Room $room)
    {
        $data = $request->validate([
            'title'            => 'sometimes|string|max:100',
            'location'         => 'sometimes|string|max:100',
            'price'            => 'sometimes|integer|min:0',
            'unit'             => 'sometimes|string|max:20',
            'capacity'         => 'nullable|string|max:50',
            'amenity'          => 'nullable|string|max:100',
            'badge'            => 'nullable|string|max:50',
            'featured'         => 'boolean',
            'status'           => 'in:active,draft,archived',
            'product_type_ids' => 'array',
            'product_type_ids.*' => 'exists:product_types,id',
        ]);

        $room->update($data);

        if (array_key_exists('product_type_ids', $data)) {
            $room->productTypes()->sync($data['product_type_ids']);
        }

        $room->load(['productTypes', 'desks']);
        return response()->json($this->formatRoom($room));
    }

    public function destroy(Room $room)
    {
        $room->delete();
        return response()->json(null, 204);
    }

    // Desk management
    public function addDesk(Request $request, Room $room)
    {
        $data = $request->validate(['number' => 'required|string|max:20', 'status' => 'in:available,occupied,maintenance']);
        $desk = $room->desks()->create($data);
        return response()->json($desk, 201);
    }

    public function updateDesk(Request $request, Room $room, Desk $desk)
    {
        $desk->update($request->validate(['number' => 'sometimes|string|max:20', 'status' => 'in:available,occupied,maintenance']));
        return response()->json($desk);
    }

    public function removeDesk(Room $room, Desk $desk)
    {
        $desk->delete();
        return response()->json(null, 204);
    }

    private function formatRoom(Room $r): array
    {
        return [
            'id'          => $r->id,
            'title'       => $r->title,
            'location'    => $r->location,
            'rating'      => $r->rating,
            'reviews'     => $r->reviews,
            'price'       => $r->price,
            'unit'        => $r->unit,
            'badge'       => $r->badge,
            'featured'    => $r->featured,
            'capacity'    => $r->capacity,
            'amenity'     => $r->amenity,
            'status'      => $r->status,
            'products'    => $r->productTypes->pluck('key'),
            'desks_total' => $r->desks->count(),
            'desks_avail' => $r->desks->where('status', 'available')->count(),
            'desks'       => $r->desks->map(fn($d) => [
                'id'     => $d->id,
                'number' => $d->number,
                'status' => $d->status,
            ]),
        ];
    }
}
