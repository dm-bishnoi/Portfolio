import { Component } from '@angular/core';

@Component({
  selector: 'app-v2',
  standalone: true,
  template: `
    <div class="v2-container">
      <section class="hero">
        <h1>V2 Theme</h1>
        <p>Alternative portfolio — light editorial</p>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #ffffff;
        color: #111111;
      }
      .hero {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        text-align: center;
        padding: 2rem;
      }
      h1 {
        font-family: 'Instrument Serif', serif;
        font-size: clamp(2rem, 5vw, 4rem);
        margin-bottom: 1rem;
      }
      p {
        color: #666;
        font-size: 1.1rem;
      }
    `,
  ],
})
export class V2Component {}
