import { browser } from '$app/environment';

export type FavoriteClassroom = {
	id: string; // aula.id
	calId: string; // calendar id (needed to build the URL)
	name: string; // aula.descrizione
	buildingName: string; // aula.relazioneEdificio.descrizione
};

class FavoritesState {
	classrooms = $state<FavoriteClassroom[]>([]);

	constructor() {
		if (browser) {
			const stored = localStorage.getItem('almaaule-favorites');
			if (stored) {
				try {
					this.classrooms = JSON.parse(stored);
				} catch (e) {
					console.error('Failed to parse favorites from localStorage', e);
				}
			}
		}
	}

	add(classroom: FavoriteClassroom) {
		if (!this.classrooms.find((c) => c.id === classroom.id)) {
			this.classrooms.push(classroom);
			this.save();
		}
	}

	remove(id: string) {
		this.classrooms = this.classrooms.filter((c) => c.id !== id);
		this.save();
	}

	isFavorite(id: string) {
		return this.classrooms.some((c) => c.id === id);
	}

	toggle(classroom: FavoriteClassroom) {
		if (this.isFavorite(classroom.id)) {
			this.remove(classroom.id);
		} else {
			this.add(classroom);
		}
	}

	private save() {
		if (browser) {
			localStorage.setItem('almaaule-favorites', JSON.stringify(this.classrooms));
		}
	}
}

export const favorites = new FavoritesState();
