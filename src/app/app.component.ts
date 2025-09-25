import { Component } from '@angular/core';
import { TimerComponent } from './features/timer/timer.component';
import {HeartIcon, MoonIcon, SunIcon} from '../assets/icons';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  imports: [TimerComponent, HeartIcon, ReactiveFormsModule, SunIcon, MoonIcon],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  protected title = 'Pomodoro Focus';

  /**
   * Form control to manage application's theme setting.
   * The value of the theme is set in the template.
   */
  themeController: FormControl<boolean | null> = new FormControl<
    boolean | null
  >(false);

  /**
   * Key used for storing theme in _localStorage
   * @private
   */
  private readonly STORAGE_KEY = "THEME" as const;

  constructor() {
    // Fix bug when use '--preferdark' in daisyUI as force the theme with that flag and broke themeController.
    const preferTheme: boolean = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;
    const currentTheme: string | null = localStorage.getItem(this.STORAGE_KEY);
    this.themeController.setValue(currentTheme ? JSON.parse(currentTheme) : preferTheme);
  }

  /**
   * Handles checkbox change event to update theme preference and serialize it.
   * @param event - Checkbox event, set theme status to themeController
   * @see themeController
   * @see LocalStorageService
   */
  onCheckboxChange(event: Event): void {
    const value: boolean = (event.target as HTMLInputElement).checked;
    this.themeController.setValue(value);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(value));
  }
}
