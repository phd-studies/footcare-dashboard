declare module "@/services/api" {
  export function symptomColor(s: string): string;
  export function getProfile(): Promise<any>;
  export function getTrajectory(): Promise<any[]>;
  export function getTimeline(userId: string): Promise<any[]>;
  export function getDailyTip(): Promise<any>;
  export function uploadWoundPhoto(args: {
    file: File | null;
    symptoms: string[];
    userId: string;
  }): Promise<any>;
  export function updateReminderSetting(enabled: boolean): Promise<any>;
}
