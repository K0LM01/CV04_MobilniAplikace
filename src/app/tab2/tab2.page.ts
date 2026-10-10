import { Component, computed, inject, OnInit, signal } from '@angular/core';import { DatePipe } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { CounterService } from '../services/counter.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSpinner,
    IonTitle,
    IonToolbar,
    IonSelect,
    IonSelectOption,
    IonSearchbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  readonly sortBy = signal('newest');
  readonly searchText = signal('');
  readonly valueFilter = signal('');

readonly sortedCounters = computed(() => {
  const counters = [...this.counterService.counters()];
  const sorting = this.sortBy();

  if (sorting === 'name') {
    counters.sort((a, b) => a.name.localeCompare(b.name, 'cs'));
  } else if (sorting === 'valueAsc') {
    counters.sort((a, b) => a.value - b.value);
  } else if (sorting === 'valueDesc') {
    counters.sort((a, b) => b.value - a.value);
  } else {
    counters.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  return counters;
});

readonly filteredCounters = computed(() => {
  const search = this.searchText().trim().toLocaleLowerCase('cs');
  const filter = this.valueFilter();

  return this.sortedCounters().filter((counter) => {
    const matchesName = counter.name
      .toLocaleLowerCase('cs')
      .includes(search);

    let matchesValue = true;

    if (filter === 'positive') {
      matchesValue = counter.value > 0;
    } else if (filter === 'negative') {
      matchesValue = counter.value < 0;
    }

    return matchesName && matchesValue;
  });
});

  readonly totalValue = computed(() => {
  let total = 0;

  for (const counter of this.counterService.counters()) {
    total += counter.value;
  }

  return total;
});

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

async remove(id: string): Promise<void> {
  await this.counterService.remove(id);
  await this.showToast('Záznam byl odstraněn.');
}

async clear(): Promise<void> {
  const alert = await this.alertController.create({
    header: 'Vymazat historii?',
    message: 'Opravdu chceš odstranit všechna uložená počítadla?',
    buttons: [
      {
        text: 'Zrušit',
        role: 'cancel',
      },
      {
        text: 'Vymazat',
        role: 'confirm',
      },
    ],
  });

  await alert.present();

  const result = await alert.onDidDismiss();

if (result.role === 'confirm') {
  await this.counterService.clear();
  await this.showToast('Celá historie byla vymazána.');
}
}
private async showToast(message: string): Promise<void> {
  const toast = await this.toastController.create({
    message,
    duration: 2000,
    position: 'top',
    color: 'success',
  });

  await toast.present();
}
}