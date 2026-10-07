import fs from 'fs';
import path from 'path';
import { initialSystemState } from '../../data/mockData';
import { SystemState } from '../../types';

const DATA_FILE_PATH = path.resolve(process.cwd(), 'data_store.json');

class DataStoreManager {
  private state: SystemState;
  private isPersisting = false;

  constructor() {
    this.state = this.loadFromDisk();
  }

  /**
   * Load system state from disk or initialize with seed data
   */
  private loadFromDisk(): SystemState {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        console.log('[DataStore] Loaded persistent application data from data_store.json');
        return parsed;
      }
    } catch (err) {
      console.warn('[DataStore] Failed to read data_store.json, initializing seed data:', err);
    }

    console.log('[DataStore] Initializing persistent DataStore with seed mock data.');
    const seed = JSON.parse(JSON.stringify(initialSystemState));
    this.saveToDiskSync(seed);
    return seed;
  }

  /**
   * Synchronous disk save helper
   */
  private saveToDiskSync(data: SystemState) {
    try {
      fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Error saving to disk:', err);
    }
  }

  /**
   * Asynchronous disk save throttle
   */
  private saveToDisk() {
    if (this.isPersisting) return;
    this.isPersisting = true;

    setTimeout(() => {
      try {
        fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
        console.log('[DataStore] Saved updated application state to disk.');
      } catch (err) {
        console.error('[DataStore] Error persisting state to disk:', err);
      } finally {
        this.isPersisting = false;
      }
    }, 100);
  }

  /**
   * Get current live state snapshot
   */
  public getState(): SystemState {
    return this.state;
  }

  /**
   * Replace state and save to disk
   */
  public setState(newState: SystemState) {
    this.state = newState;
    this.saveToDisk();
  }

  /**
   * Mutate state via callback and save to disk
   */
  public updateState(updater: (currentState: SystemState) => SystemState): SystemState {
    this.state = updater(this.state);
    this.saveToDisk();
    return this.state;
  }

  /**
   * Reset data store to initial seed data
   */
  public resetToSeed(): SystemState {
    console.log('[DataStore] Resetting DataStore to initial seed data.');
    this.state = JSON.parse(JSON.stringify(initialSystemState));
    this.saveToDiskSync(this.state);
    return this.state;
  }
}

export const DataStore = new DataStoreManager();
