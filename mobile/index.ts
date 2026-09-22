// Custom entry: background tasks must be defined at global scope before any
// route loads, or a headless relaunch after the OS kills the app finds no task.
import "./lib/tracking";
import "expo-router/entry";
