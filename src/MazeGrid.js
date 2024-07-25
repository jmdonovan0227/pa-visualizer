import { useState, useEffect, useMemo } from 'react';
import './MazeGrid.css';

function MazeGrid() {
  const [maze, setMaze] = useState([]);
  const [timeoutIds, setTimeoutIds] = useState([]);
  const [width, setWidth] = useState(20);
  const [height, setHeight] = useState(20);
  const [inputWidth, setInputWidth] = useState(0);
  const [inputHeight, setInputHeight] = useState(0);
  const navSound = useMemo(() => new Audio('/click.mp3'), []);
  const winSound = useMemo(() => new Audio('/maze_solved.mp3'), []);

  useEffect(() => {
    navSound.pause();
    navSound.currentTime = 0;
    winSound.pause();
    winSound.currentTime = 0;
  }, [navSound, winSound]);

  const resetSounds = () => {
    navSound.pause();
    navSound.currentTime = 0;
    winSound.pause();
    winSound.currentTime = 0;
  };



  const updateInputHeight = (event) => {
    setInputHeight(event.target.value);
  };

  const updateInputWidth = (event) => {
    setInputWidth(event.target.value);
  };

  const onGenerateMazeSubmit = () => {
    resetSounds();
    if(Number.isNaN(Number(inputWidth)) || Number.isNaN(Number(inputHeight)) || inputWidth < 5 || inputHeight < 5 || inputWidth > 50 || inputHeight > 50) {
      return;
    }
    else {
      timeoutIds.forEach(clearTimeout);
      setTimeoutIds([]);
      setHeight(inputHeight);
      setWidth(inputWidth);
      generateMaze(Number(inputHeight), Number(inputWidth));
    }
  };

  function bfs(startNode) {
    if(!maze.length) {
      return;
    }

    let queue = [startNode];
    let visited = new Set(`${startNode[0]},${startNode[1]}`);
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    const visitCell = ([x, y]) => {
      setMaze((prevMaze) => prevMaze.map((row, rowIndex) => 
        row.map((cell, cellIndex) => {
          if(rowIndex === y && cellIndex === x) {
            return cell === 'end' ? 'end' : 'visited';
          }

          return cell;
        })
      ));

      if(maze[y][x] === 'end') {
        winSound.volume = 0.05;
        winSound.play();
        return true;
      }
      
      navSound.volume = 0.00625;
      navSound.play();
      return false;
    };

    const step = () =>  {
      if(!queue.length) return;
      const [x, y] = queue.shift();

      for(const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
  
        if(nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
  
          if(maze[ny][nx] === 'path' || maze[ny][nx] === 'end') {
            if(visitCell([nx, ny])) {
              return true;
            }
  
            queue.push([nx, ny]);
          }
        }
      }

      const timeoutId = setTimeout(step, 100);
      setTimeoutIds((previousTimeoutIds) => [...previousTimeoutIds, timeoutId]);
    };

    step();
    return false;
  }

  function dfs(startNode) {
    if(!maze.length) {
      return;
    }

    let stack = [startNode];
    let visited = new Set(`${startNode[0]},${startNode[1]}`);
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    
    const visitCell = ([x, y]) => {
      setMaze((prevMaze) => prevMaze.map((row, rowIndex) => 
        row.map((cell, cellIndex) => {
          if(rowIndex === y && cellIndex === x) {
            return cell === 'end' ? 'end' : 'visited';
          }

          return cell;
        })
      ));

      if(maze[y][x] === 'end') {
        winSound.volume = 0.05;
        winSound.play();
        return true;
      }

      navSound.volume = 0.00625;
      navSound.play();
      return false;
    };

    const step = () =>  {
      if(!stack.length) return;
      const [x, y] = stack.pop();

      for(const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
  
        if(nx >= 0 && nx < width && ny >= 0 && ny < height && !visited.has(`${nx},${ny}`)) {
          visited.add(`${nx},${ny}`);
  
          if(maze[ny][nx] === 'path' || maze[ny][nx] === 'end') {
            if(visitCell([nx, ny])) {
              return true;
            }
  
            stack.push([nx, ny]);
          }
        }
      }

      const timeoutId = setTimeout(step, 100);
      setTimeoutIds((previousTimeoutIds) => [...previousTimeoutIds, timeoutId]);
    };

    step();
  }

  function generateMaze(height, width) {
    let matrix = [];

    for(let i = 0; i < height; i++) {
      let row = [];

      for(let j = 0; j < width; j++) {
        row.push('wall');
      }

      matrix.push(row);
    }

    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

    const isCellValid = (x, y) => y >= 0 && x >= 0 && x < width && y < height && matrix[y][x] === 'wall';

    function createPath(x, y) {
      matrix[y][x] = 'path';
      
      const directionsRandomSort = directions.sort(() => Math.random() - 0.5);

      for(let [dx, dy] of directionsRandomSort) {
        const nx = x + dx * 2;
        const ny = y + dy * 2;

        if(isCellValid(nx, ny)) {
          matrix[y + dy][x + dx] = 'path';
          createPath(nx, ny);
        }
      }
    }

    createPath(1, 1);
    matrix[1][0] = 'start';
    matrix[height - 2][width - 1] = 'end';
    setMaze(matrix);
  }

  function refreshMaze() {
    resetSounds();
    timeoutIds.forEach(clearTimeout);
    setTimeoutIds([]);
    setWidth(20);
    setHeight(20);
    generateMaze(20, 20);
  }

  return (
    <div className='maze-grid' style={{'--width': width, '--height': height}}>
      <div className='enter-maze-info'>
        <h1 className='header-style'>Maze Pathfinder</h1>
        <div>
          <p>Thank you for trying Maze Pathfinder! Using Refresh Maze Creates A Default Maze of Size 20x20. The minimum size for a maze is 5x5, while the max size is 50x50. Click the generate maze button to create mazes with specified sizes.</p>
        </div>
        <div className='rows'>
          <label htmlFor='height' className='labels'>Maze Height</label>
          <input onChange={updateInputHeight} className='inputs' type='text' id='height' />
        </div>

        <div className='rows'>
          <label htmlFor='width' className='labels'>Maze Width</label>
          <input onChange={updateInputWidth} className='inputs' type='text' id='width' />
        </div>

        <div className='generate-maze'>
          <button onClick={onGenerateMazeSubmit} className='maze-button'>Generate Maze</button>
          <button className='maze-button' onClick={refreshMaze}>Refresh Maze</button>
          <button className='maze-button' onClick={() => bfs([1, 0])}>Start BFS</button>
          <button className='maze-button' onClick={() => dfs([1, 0])}>Start DFS</button>
        </div>
      </div>

      <div className='maze'>
        {
          maze.map((row, rowIndex) => (
            <div className='row'>
              {
                row.map((cell, cellIndex) => (
                  <div className={`cell ${cell}`}></div>
                ))
              }
            </div>
          ))
          }
      </div>
    </div>
  );
}

export default MazeGrid;
