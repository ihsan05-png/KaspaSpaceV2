<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\OvertimeSchedule;
use Illuminate\Http\Request;

class OvertimeController extends Controller {
    public function schedules(Request $request) {
        $query = OvertimeSchedule::with('room')->where('active', true);
        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }
        return response()->json($query->orderBy('day_of_week')->get());
    }
}
