<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\{VoPackage, VoBundle};

class VoPackageController extends Controller {
    public function index() {
        return response()->json([
            'packages' => VoPackage::where('active', true)->orderBy('sort_order')->get(),
            'bundles'  => VoBundle::where('active', true)->orderBy('sort_order')->get(),
        ]);
    }
}
