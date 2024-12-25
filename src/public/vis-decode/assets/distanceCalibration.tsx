import React, { useState, useRef, useEffect } from 'react';
import { StimulusParams } from '../../../store/types';

const ViewingDistanceCalibration: React.FC<StimulusParams<any>> = ({ parameters, setAnswer }) => {
    const ballRef = useRef<HTMLDivElement>(null);
    const squareRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | null>(null);
    const { taskid, pixelsPerMM = null, blindspotAngle = 13.5 } = parameters;
  
    // States
    const [ballPositions, setBallPositions] = useState<number[]>([]);
    const [isTracking, setIsTracking] = useState(false);
    const [viewingDistance, setViewingDistance] = useState<number | null>(null);
    const [clickCount, setClickCount] = useState<number>(5);
  
    // Utility functions
    const degToRadians = (degrees: number) => {
      return (degrees * Math.PI) / 180;
    };
  
    // Calculate viewing distance function
    const calculateViewingDistance = (positions: number[]) => {
      if (!positions.length || !pixelsPerMM || !squareRef.current) return;
  
      const avgBallPos = positions.reduce((a, b) => a + b, 0) / positions.length;
      const squareRect = squareRef.current.getBoundingClientRect();
      const squarePos = squareRect.left;
      const ballSquareDistance = Math.abs(avgBallPos - squarePos) / pixelsPerMM;
      const viewDistance = ballSquareDistance / Math.tan(degToRadians(blindspotAngle));
  
      setViewingDistance(viewDistance);
      setIsTracking(false);
  
      setAnswer({
        status: true,
        answers: {
          [taskid]: {
            distanceMM: viewDistance,
            distanceCM: viewDistance / 10,
            ballPositions: positions
          }
        }
      });
    };
  
    // Reset ball to starting position
    const resetBall = () => {
      if (ballRef.current) {
        ballRef.current.style.left = '740px';
      }
    };
  
    // Animation control functions
    const startBlindspotTracking = () => {
      if (!ballRef.current || !squareRef.current || !pixelsPerMM) return;
  
      setIsTracking(true);
      resetBall(); // Reset ball position before starting
  
      const animateBall = () => {
        if (!ballRef.current) return;
  
        const currentLeft = parseInt(ballRef.current.style.left || '740');
        const newLeft = currentLeft - 2; // Move left by decreasing left value
        ballRef.current.style.left = `${newLeft}px`;
  
        animationFrameRef.current = requestAnimationFrame(animateBall);
      };
  
      animationFrameRef.current = requestAnimationFrame(animateBall);
    };
  
    const stopTracking = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setIsTracking(false);
    };
  
    // Handle spacebar press
    useEffect(() => {
      const handleKeyPress = (event: KeyboardEvent) => {
        if (event.code === 'Space') {
          event.preventDefault();
  
          if (!isTracking) {
            startBlindspotTracking();
          } else {
            // Record position and stop
            if (ballRef.current) {
              const ballRect = ballRef.current.getBoundingClientRect();
              setBallPositions(prev => {
                const newPositions = [...prev, ballRect.left];
                setClickCount(prevCount => {
                  const newCount = prevCount - 1;
                  if (newCount <= 0) {
                    stopTracking();
                    calculateViewingDistance(newPositions);
                  }
                  return newCount;
                });
                return newPositions;
              });
              stopTracking(); // Stop the animation
              resetBall(); // Reset the ball position immediately
            }
          }
        }
      };
  
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isTracking]);
  
    // Reset state when pixelsPerMM changes
    useEffect(() => {
      setViewingDistance(null);
      setIsTracking(false);
      setBallPositions([]);
      setClickCount(5);
      resetBall();
  
      return () => {
        setViewingDistance(null);
        setIsTracking(false);
        setBallPositions([]);
        setClickCount(5);
      };
    }, [pixelsPerMM]);
  
    // Cleanup animation frame on unmount
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, []);
  
    if (!pixelsPerMM) {
      return <div>Please complete card calibration first.</div>;
    }
  
    return (
      <div className="viewing-distance-calibration">
        <div className="instructions" style={{ marginBottom: '20px' }}>
          <ol>
            <li>Put your left hand on the <b>space bar</b>.</li>
            <li>Cover your right eye with your right hand.</li>
            <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>
            <li>The <span style={{color: "red", fontWeight: "bold"}}>red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>
          </ol>
        <p style={{textAlign: "center"}}>Press the space bar when you are ready to begin.</p>
        </div>
        <div
          style={{
            position: 'relative',
            width: '900px',
            height: '100px',
            margin: '20px auto',
            backgroundColor: '#ffffff',
          }}
        >
          <div
            ref={ballRef}
            style={{
              position: 'absolute',
              width: '30px',
              height: '30px',
              backgroundColor: 'rgb(255, 0, 0)',
              borderRadius: '30px',
              top: '50%',
              left: '740px',
              transform: 'translateY(-50%)'
            }}
          />
          <div
            ref={squareRef}
            style={{
              position: 'absolute',
              width: '30px',
              height: '30px',
              backgroundColor: 'rgb(0, 0, 0)',
              top: '50%',
              left: '870px',
              transform: 'translateY(-50%)'
            }}
          />
        </div>

        <p style={{textAlign: "center"}}>Remaining measurements: {clickCount}</p>
  
        {viewingDistance && (
          <div className="results">
            <h3>Viewing Distance Results</h3>
            <p>Estimated Viewing Distance: {(viewingDistance / 10).toFixed(1)} cm</p>
            <p>Number of measurements: {ballPositions.length}</p>
          </div>
        )}
      </div>
    );
  };

export default ViewingDistanceCalibration;