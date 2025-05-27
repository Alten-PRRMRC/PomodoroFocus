import { Component } from '@angular/core';
import { AsyncPipe, DatePipe } from '@angular/common';
import {timer, map, takeWhile, type Observable, tap} from 'rxjs';

const TOMATO_TIME = 1500000; // Set the initial timer for 25 minutes
@Component({
  selector: 'app-timer',
  imports: [AsyncPipe, DatePipe],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css'
})
export class TimerComponent {
  // Timer status (Started = true, Stopped = false)
  isStarted: boolean;
  // Button label
  labelStatus: string;
  // Time remaining in millis shown when stopped
  millis: number;
  // Initial time in millis
  initialMillis: number;
  // Timer shown when running
  timer: Observable<number>;

  constructor() {
    this.initialMillis = TOMATO_TIME;
    this.millis = this.initialMillis;
    this.timer = this.getTimer;
    this.isStarted = false;
    this.labelStatus = "Start";
  }

  get getTimer(){
    return timer(0, 1000) //Observable that begins at 0 and updates every second (1000 milliseconds)
      .pipe(
        tap({ // An extension to the observables that enables us to perform actions whenever a change occurs.
          next: () => { // Runs each time the next value is emitted.
            this.millis -= 1000; // Decrease timer of 1 second
          },
          finalize: () => { // When the Observable has finished
            this.timerToggle(); // Stop the timer, assuming it has already started.
          }}),
        map(_ => this.millis), // We assign the timer value to the millis.
        takeWhile(n => n > -1000) // Continue until the timer has expired
      );
  }

  timerToggle(status = !this.isStarted) {
    if(this.millis <= 0){ // If, when we stop the timer, it is finished...
      this.millis = this.initialMillis; // ...we reset it to the initial value
    }
    this.isStarted = status; // We display the value of the Observable instead of millis, and vice versa
    this.labelStatus = this.isStarted ? "Stop" : "Start"; // Change the label in the button
  }

  setTimer(millis: number){ // Function that resets the following values and is invoked when switching modes.
    this.initialMillis = millis;
    this.millis = this.initialMillis;
    this.timer = this.getTimer; 
    this.timerToggle(false); // Stop timer when switching modes.
  }

}
