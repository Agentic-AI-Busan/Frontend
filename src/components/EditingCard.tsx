import React from 'react';
import styled from 'styled-components';
import { getDayColor } from './Map/MapContent';

interface VisitPlace {
    id: number;
    name: string;
    memo: string;
    time?: string;
    location?: string;
    imageUrl?: string;
}

interface EditingCardProps {
    place: VisitPlace;
    dayNumber: number;
    placeIndex: number;
    dayIndex: number;
    isDragEnabled: boolean;
    draggedItem: { dayIndex: number, placeIndex: number } | null;
    dragOverItem: { dayIndex: number, placeIndex: number, position?: 'top' | 'bottom' } | null;
    updatePlace: (dayIndex: number, placeId: number, field: keyof VisitPlace, value: string) => void;
    deletePlace: (dayIndex: number, placeId: number) => void;
    handleDragStart: (e: React.DragEvent, dayIndex: number, placeIndex: number) => void;
    handleDragOver: (e: React.DragEvent, dayIndex: number, placeIndex: number) => void;
    handleDragEnd: (e: React.DragEvent) => void;
    handleDragLeave: (e: React.DragEvent) => void;
    handleDrop: (e: React.DragEvent) => void;
    handleOptionsMouseDown: (e: React.MouseEvent) => void;
    handleOptionsMouseUp: (e: React.MouseEvent) => void;
    preventDragHandler: (e: React.DragEvent) => void;
}

const EditingCard: React.FC<EditingCardProps> = ({
    place,
    dayNumber,
    placeIndex,
    dayIndex,
    isDragEnabled,
    draggedItem,
    dragOverItem,
    updatePlace,
    deletePlace,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragLeave,
    handleDrop,
    handleOptionsMouseDown,
    handleOptionsMouseUp,
    preventDragHandler
}) => {
    return (
        <PlaceItem
        key={place.id}
        data-place-id={place.id}
        draggable={isDragEnabled}
        onDragStart={(e) => handleDragStart(e, dayIndex, placeIndex)}
        onDragOver={(e) => handleDragOver(e, dayIndex, placeIndex)}
        onDragEnd={handleDragEnd}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
            ${draggedItem?.dayIndex === dayIndex && draggedItem?.placeIndex === placeIndex ? 'dragging' : ''}
            ${dragOverItem && draggedItem && 
            dragOverItem.dayIndex === dayIndex && 
            dragOverItem.placeIndex === placeIndex && 
            !(draggedItem.dayIndex === dayIndex && draggedItem.placeIndex === placeIndex) 
                ? (dragOverItem.position === 'top' ? 'drag-over-top' : 'drag-over-bottom') 
                : ''}
        `}
        >
        <PlaceHeader>
            <PlaceNumberBadge dayNumber={dayNumber}>{placeIndex + 1}</PlaceNumberBadge>
            <PlaceName>{place.name}</PlaceName>
            <OptionsContainer>
            <DeleteButton onClick={() => deletePlace(dayIndex, place.id)}>
                <DeleteIcon>삭제</DeleteIcon>
            </DeleteButton>
            <OptionsButton 
                onMouseDown={handleOptionsMouseDown}
                onMouseUp={handleOptionsMouseUp}
                onMouseLeave={handleOptionsMouseUp}
            >
                <DotsContainer>
                    <DotsRow>
                        <OptionsDot />
                        <OptionsDot />
                        <OptionsDot />
                    </DotsRow>
                    <DotsRow>
                        <OptionsDot />
                        <OptionsDot />
                        <OptionsDot />
                    </DotsRow>
                </DotsContainer>
            </OptionsButton>
            </OptionsContainer>
        </PlaceHeader>
        
        <PlaceDetails>
            {place.time && (
            <PlaceTime>
                <TimeIcon>🕒</TimeIcon>
                {place.time}
            </PlaceTime>
            )}
            {place.location && (
            <PlaceLocation>
                <LocationIcon>📍</LocationIcon>
                {place.location}
            </PlaceLocation>
            )}
        </PlaceDetails>
        
        <MemoContainer>
            <MemoInput
            value={place.memo}
            onChange={(e) => updatePlace(dayIndex, place.id, 'memo', e.target.value)}
            placeholder="여행 메모를 입력해 주세요..."
            onDragStart={preventDragHandler}
            />
        </MemoContainer>
        </PlaceItem>
    );
};

// 스타일 컴포넌트
const PlaceItem = styled.div`
    background-color: white;
    border-radius: 10px;
    padding: 14px 16px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.3s, background-color 0.3s;
    cursor: default;
    position: relative;
    
    &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
    }
    
    &[draggable=true] {
        cursor: grab;
        
        &:hover {
        transform: translateY(-2px);
        }
        
        &:active {
        cursor: grabbing;
        }
    }
    
    &.dragging {
        opacity: 0.5;
        transform: scale(1.02);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.15);
        z-index: 10;
    }
    
    &.drag-over-top {
        background-color: transparent;
        border: none;
        padding: 14px 16px;
        position: relative;
    }
    
    &.drag-over-top:before {
        content: '';
        position: absolute;
        top: -4px;
        left: 0;
        width: 100%;
        height: 4px;
        background-color: #3b82f6;
        border-radius: 2px;
        animation: pulse 1s infinite;
    }
    
    &.drag-over-bottom {
        background-color: transparent;
        border: none;
        padding: 14px 16px;
        position: relative;
    }
    
    &.drag-over-bottom:after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 4px;
        background-color: #3b82f6;
        border-radius: 2px;
        animation: pulse 1s infinite;
    }
    
    @keyframes pulse {
        0% {
        opacity: 0.6;
        }
        50% {
        opacity: 1;
        }
        100% {
        opacity: 0.6;
        }
    }
`;

const PlaceHeader = styled.div`
    display: flex;
    align-items: center;
    margin: 3px 3px 8px 3px;
`;

const PlaceNumberBadge = styled.div<{ dayNumber: number }>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    background-color: ${props => getDayColor(props.dayNumber)};
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    margin-right: 10px;
`;

const PlaceName = styled.h3`
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0;
    flex: 1;
`;

const OptionsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const DeleteButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: color 0.2s;
    transform: translateY(1px);
    color: #64748b;
    
    &:hover {
        color: #e74c3c;
    }
`;

const DeleteIcon = styled.span`
    font-size: 14px;
    font-weight: 500;
    margin-right: 4px;
`;

const OptionsButton = styled.button`
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 3px 8px;
    cursor: pointer;
    border-radius: 4px;
    
    &:hover {
        background-color: #f1f5f9;
    }
`;

const DotsContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 3px;
`;

const DotsRow = styled.div`
    display: flex;
    flex-direction: row;
    gap: 3px;
`;

const OptionsDot = styled.div`
    width: 4px;
    height: 4px;
    background-color: #64748b;
    border-radius: 50%;
    margin: 0;
`;

const PlaceDetails = styled.div`
    margin-bottom: 12px;
    margin-left: 34px;
`;

const PlaceTime = styled.div`
    display: flex;
    align-items: center;
    font-size: 13px;
    color: #64748b;
    margin-bottom: 6px;
`;

const TimeIcon = styled.span`
    margin-right: 8px;
    transform: translateY(1px);
`;

const PlaceLocation = styled.div`
    display: flex;
    align-items: flex-start;
    font-size: 13px;
    color: #64748b;
`;

const LocationIcon = styled.span`
    margin-right: 8px;
    flex-shrink: 0;
`;

const MemoContainer = styled.div`
    margin-top: 12px;
    padding: 0 4px;
`;

const MemoInput = styled.textarea`
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    font-size: 13px;
    min-height: 60px;
    resize: vertical;
    transition: border-color 0.2s;
    
    &:focus {
        outline: none;
        border-color: #3b82f6;
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
    
    &::placeholder {
        color: #94a3b8;
    }
`;

export default EditingCard;