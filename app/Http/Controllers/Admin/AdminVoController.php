<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\{VoPackage, VoBundle};
use Illuminate\Http\Request;

class AdminVoController extends Controller
{
    public function packages()
    {
        return response()->json(VoPackage::orderBy('sort_order')->get());
    }

    public function storePackage(Request $request)
    {
        $data = $request->validate([
            'tier'       => 'required|in:Bronze,Platinum,Gold,Diamond',
            'tagline'    => 'nullable|string|max:150',
            'price'      => 'required|integer|min:0',
            'unit'       => 'required|string|max:20',
            'features'   => 'nullable|array',
            'popular'    => 'boolean',
            'sort_order' => 'integer|min:0',
            'active'     => 'boolean',
        ]);
        return response()->json(VoPackage::create($data), 201);
    }

    public function updatePackage(Request $request, VoPackage $voPackage)
    {
        $voPackage->update($request->validate([
            'tier'       => 'sometimes|in:Bronze,Platinum,Gold,Diamond',
            'tagline'    => 'nullable|string|max:150',
            'price'      => 'sometimes|integer|min:0',
            'unit'       => 'sometimes|string|max:20',
            'features'   => 'nullable|array',
            'popular'    => 'boolean',
            'sort_order' => 'integer|min:0',
            'active'     => 'boolean',
        ]));
        return response()->json($voPackage);
    }

    public function destroyPackage(VoPackage $voPackage)
    {
        $voPackage->delete();
        return response()->json(null, 204);
    }

    public function bundles()
    {
        return response()->json(VoBundle::orderBy('sort_order')->get());
    }

    public function storeBundle(Request $request)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:150',
            'price'      => 'required|integer|min:0',
            'unit'       => 'required|string|max:20',
            'features'   => 'nullable|array',
            'sort_order' => 'integer|min:0',
            'active'     => 'boolean',
        ]);
        return response()->json(VoBundle::create($data), 201);
    }

    public function updateBundle(Request $request, VoBundle $voBundle)
    {
        $voBundle->update($request->validate([
            'name'       => 'sometimes|string|max:150',
            'price'      => 'sometimes|integer|min:0',
            'unit'       => 'sometimes|string|max:20',
            'features'   => 'nullable|array',
            'sort_order' => 'integer|min:0',
            'active'     => 'boolean',
        ]));
        return response()->json($voBundle);
    }

    public function destroyBundle(VoBundle $voBundle)
    {
        $voBundle->delete();
        return response()->json(null, 204);
    }
}
