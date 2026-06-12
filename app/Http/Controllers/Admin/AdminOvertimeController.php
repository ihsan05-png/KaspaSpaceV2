<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\OvertimeSchedule;
use Illuminate\Http\Request;

class AdminOvertimeController extends Controller
{
    public function index(Request $request)
    {
        $query = OvertimeSchedule::with('room');
        if ($request->filled('room_id')) {
            $query->where('room_id', $request->room_id);
        }
        return response()->json($query->orderBy('day_of_week')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'room_id'     => 'required|exists:rooms,id',
            'day_of_week' => 'required|integer|min:0|max:6',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'active'      => 'boolean',
        ]);
        $schedule = OvertimeSchedule::updateOrCreate(
            ['room_id' => $data['room_id'], 'day_of_week' => $data['day_of_week']],
            $data
        );
        return response()->json($schedule->load('room'), 201);
    }

    public function update(Request $request, OvertimeSchedule $overtimeSchedule)
    {
        $overtimeSchedule->update($request->validate([
            'start_time' => 'sometimes|date_format:H:i',
            'end_time'   => 'sometimes|date_format:H:i|after:start_time',
            'active'     => 'boolean',
        ]));
        return response()->json($overtimeSchedule->load('room'));
    }

    public function destroy(OvertimeSchedule $overtimeSchedule)
    {
        $overtimeSchedule->delete();
        return response()->json(null, 204);
    }
}
