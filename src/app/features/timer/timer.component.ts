import { AsyncPipe, DatePipe } from "@angular/common";
import { Component } from "@angular/core";
import {type Observable, map, takeWhile, timer, BehaviorSubject, switchMap, of, finalize} from "rxjs";
import { Mode } from "./mode.enum";

const TOMATO_TIME = 1500000; // Set the initial timer for 25 minutes
const SHORT_PAUSE = 300000; // Set short break timer for 5 minutes
const LONG_PAUSE = 900000; // Set long break timer for 15 minutes

@Component({
  selector: "app-timer",
  imports: [AsyncPipe, DatePipe],
  templateUrl: "./timer.component.html",
  styleUrl: "./timer.component.css",
})
export class TimerComponent {
  // Timer status (Started = true, Stopped = false)
  isStarted: BehaviorSubject<boolean> = new BehaviorSubject(false);
  // Button label
  labelStatus: string;
  // Time remaining in millis shown when stopped
  millis: number;
  // Initial time in millis
  initialMillis: number;
  // Timer shown when running
  timer: Observable<number>;
  // Next mode, integer is tomato, float is normal pause, pair integer is long pause
  nextMode: number;

  constructor() {
    // Initialize values or retrieve them from local storage if available.
    const initialMillis = localStorage.getItem("initialMillis");
    const millis = localStorage.getItem("millis");
    const isStarted = localStorage.getItem("isStarted") ?? JSON.stringify(false);
    const labelStatus = localStorage.getItem("labelStatus");
    const nextMode = localStorage.getItem("nextMode");

    this.initialMillis = initialMillis
      ? JSON.parse(initialMillis)
      : TOMATO_TIME;
    this.millis =
      millis && JSON.parse(millis) >= 0
        ? JSON.parse(millis)
        : this.initialMillis;
    this.isStarted.next(JSON.parse(isStarted));
    this.timer = this.getTimer;
    this.labelStatus = labelStatus ? JSON.parse(labelStatus) : "Start";
    this.nextMode = nextMode ? JSON.parse(nextMode) : 0;
  }

  get getTimer(): Observable<number> {
    const clock$: Observable<number> = timer(0, 1000);
    return this.isStarted //Observable that begins at 0 and updates every second (1000 milliseconds)
      .pipe(
        switchMap(started => { // An extension to the observables that enables us to perform actions whenever a change occurs.
          if (started) {
            return clock$.pipe(
              map((): number => {
                // Runs each time the next value is emitted.
                this.millis -= 1000; // Decrease timer of 1 second
                this.save(); // Save the current state
                return this.millis;
              }),
              takeWhile((n) => n > -1000), // Continue until the timer has expired
              finalize(() => {
                // When the Observable has finished
                if (this.millis > 1) return;
                this.changeMode(); // Stop the timer, change mode and save the current state
              })
            )
          }
          return of(this.millis);
          }),
    );
  }

  changeMode() {
    this.nextMode += Mode.ShortPause;
    if (this.nextMode >= Mode.Reset) {
      this.nextMode = Mode.Tomato;
    }
    if (this.nextMode % 1 === 0) {
      // Check if is float nextMode
      this.setTimer(this.nextMode === 2 ? LONG_PAUSE : TOMATO_TIME);
    } else {
      this.setTimer(SHORT_PAUSE);
    }
  }

  timerToggle(status = !this.isStarted.value) {
    if (this.millis <= 0) {
      // If, when we stop the timer, it is finished...
      this.millis = this.initialMillis; // ...we reset it to the initial value
    }
    this.isStarted.next(status); // We display the value of the Observable instead of millis, and vice versa
    this.labelStatus = this.isStarted.value ? "Stop" : "Start"; // Change the label in the button
    this.save();
  }

  setTimer(millis: number, isChangedByUser = false, mode = 0) {
    // Function that resets the following values and is invoked when switching modes.
    if (isChangedByUser) {
      // If user change mode, then reset mode
      this.nextMode = mode;
    }
    this.initialMillis = millis;
    this.millis = this.initialMillis;
    this.timer = this.getTimer;
    this.timerToggle(false); // Stop timer when switching modes.
  }

  private save() {
    localStorage.setItem("nextMode", JSON.stringify(this.nextMode));
    localStorage.setItem("initialMillis", JSON.stringify(this.initialMillis));
    localStorage.setItem("millis", JSON.stringify(this.millis));
    localStorage.setItem("isStarted", JSON.stringify(this.isStarted.value));
    localStorage.setItem("labelStatus", JSON.stringify(this.labelStatus));
  }
}
