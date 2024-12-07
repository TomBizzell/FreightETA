import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState } from 'react';

interface Schedule {
  id: string;
  driverName: string;
  time: string;
  destination: string;
}

export function DriverSchedule() {
  const [schedules, setSchedules] = useState<Schedule[]>([
    // Your schedule data here
  ]);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(schedules);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSchedules(items);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="schedules">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2"
          >
            {schedules.map((schedule, index) => (
              <Draggable 
                key={schedule.id} 
                draggableId={schedule.id} 
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-4 bg-white rounded-lg shadow"
                  >
                    <h3 className="font-bold">{schedule.driverName}</h3>
                    <p>{schedule.time}</p>
                    <p>{schedule.destination}</p>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
} 