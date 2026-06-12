<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class DocumentUploadController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('file')->store('documents', 'public');

        return response()->json([
            'url'  => asset('storage/' . $path),
            'name' => $request->file('file')->getClientOriginalName(),
        ]);
    }
}
