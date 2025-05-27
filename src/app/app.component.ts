import { Component } from '@angular/core';
import { ResponsiveComponent } from "./shared/responsive/responsive.component";
import { TimerComponent } from "../timer/timer.component";

@Component({
  selector: 'app-root',
  imports: [ResponsiveComponent, TimerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Pomodoro Focus';
}
