import React from 'react';

interface Props {
  onDateChange: (start: string, end: string) => void;
}

export default function SessionFilter({ onDateChange }: Props) {
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = e.target.value;
    const endDate = (document.getElementById('endDate') as HTMLInputElement)?.value || '';
    onDateChange(startDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const endDate = e.target.value;
    const startDate = (document.getElementById('startDate') as HTMLInputElement)?.value || '';
    onDateChange(startDate, endDate);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3">
        <div className="input-group input-group-sm">
          <span className="bg-base-100 min-w-12 flex items-center justify-center font-medium">
            From
          </span>
          <input
            id="startDate"
            type="date"
            className="input input-sm input-bordered w-full bg-base-100"
            onChange={handleStartDateChange}
            placeholder="Start date"
          />
        </div>
        <div className="input-group input-group-sm">
          <span className="bg-base-100 min-w-12 flex items-center justify-center font-medium">
            To
          </span>
          <input
            id="endDate"
            type="date"
            className="input input-sm input-bordered w-full bg-base-100"
            onChange={handleEndDateChange}
            placeholder="End date"
          />
        </div>
      </div>
    </div>
  );
} 