import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
  let button = <button className="square" onClick={props.onClick}>
    {props.value}
  </button>
  if (props.winSquares.includes(props.index)) {
    button = <button className="square square-highlight" onClick={props.onClick}>
      {props.value}
    </button>
  }
  return button;
}

class Board extends React.Component {
  renderSquare(i) {
    return (<Square
      value={this.props.squares[i]}
      winSquares={this.props.winSquares}
      index={i}
      key={i}
      onClick={() => this.props.onClick(i)}
    />);
  }

  render() {
    let board = []
    for (let i = 0; i < 3; i++) {
      let row = []
      for (let j = 0; j < 3; j++) {
        row.push(this.renderSquare(i * 3 + j));
      }
      board.push(<div key={i} className="board-row">{row}</div>);
    }
    board = <div>{board}</div>;
    return board;
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      stepNumber: 0,
      xIsNext: true,
      jumped: false,
      reverse: false,
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    const coor = [Math.trunc(i / 3), i % 3];
    if (calculateWinner(squares).side || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        coor: coor,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      jumped: false,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
      jumped: true,
    });
  }

  reverseOrder() {
    this.setState({
      reverse: !this.state.reverse,
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let status;
    if (winner.side) {
      status = 'Winner: ' + winner.side;
    } else if (!isTie(current.squares)) {
      status = 'Tied, no winner for this round!';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    const moves = history.map((step, move, history) => {
      if (this.state.reverse) {
        move = history.length - 1 - move;
        step = history[move];
      }
      
      let desc = move ?
        `Go to move #${move} (${step.coor[0]}, ${step.coor[1]})` :
        'Go to game start';

      if (this.state.jumped && move === this.state.stepNumber)
        desc = <b>{desc}</b>;

      return (
        <li key={move}>
          <button onClick={() => this.jumpTo(move)}>{desc}</button>
        </li>
      );
    });

    return (
      <div className="game">
        <div className="game-board">
          <Board
            winSquares={winner.squares}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div className="status">{status}</div>
          <button onClick={() => this.reverseOrder()}>Toggle Order</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        side: squares[a],
        squares: [a, b, c],
      };
    }
  }
  return {
    side: null,
    squares: [],
  };
}

function isTie(squares) {
  return squares.filter(d => d===null).length !== 0;
}
