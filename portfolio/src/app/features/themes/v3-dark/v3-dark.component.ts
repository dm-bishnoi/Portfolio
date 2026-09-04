import { Component } from '@angular/core';

@Component({
  selector: 'app-v3-dark',
  standalone: true,
  template: `
    <div class="v3-dark-container">
      <section class="hero">
        <h1>V3 Dark Theme</h1>
        <p>Primary theme — dark, scroll-driven 3D</p>
      </section>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        background: #07080C;
        color: #F4F5FA;
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
        color: rgba(244, 245, 250, 0.7);
        font-size: 1.1rem;
      }
    `,
  ],
})
export class V3DarkComponent {}
