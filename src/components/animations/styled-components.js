import styled, { css, keyframes } from "styled-components"

export const fadeInLeftKeyframes = keyframes`
  0% {
    transform: translateX(-20px);
    opacity: 0%;
  }
  
  100% {
    transform: translateX(0px);
    opacity: 100%;
  }
`

const fadeInBottomKeyframes = keyframes`
  from {
    opacity: 0;
    transform: translateY(100px);
  }
  to {
    opacity: 1;
    transform: translateY(0%);
  }
`

const rotateInBottomKeyframes = keyframes`
  from {
    opacity: 0;
    transform: translateY(100px) rotate(-3deg);
  }
  to {
    opacity: 1;
    transform: translateY(0%) rotate(0deg);
  }
`

const zoomOutKeyframes = keyframes`
  from {
    transform: scale(1.2);
  }
  to {
    transform: scale(1);
  }
`

export const FadeInLeft = styled.div`
  animation-duration: ${props => (props.duration ? props.duration : 0)}ms;
  animation-delay: ${props => (props.delay ? props.delay : 0)}ms;
  animation-name: ${fadeInLeftKeyframes};
  animation-timing-function: cubic-bezier(0.39, 0.58, 0.57, 1);
  opacity: 0;
  animation-fill-mode: forwards;
  animation-play-state: ${props => (props.play ? "running" : "paused")};
`

export const FadeInBottom = styled.div`
  animation-name: ${fadeInBottomKeyframes};
  animation-duration: ${props => (props.duration ? props.duration : 0)}ms;
  opacity: 0;
  transition: opacity ease-in-out, transform ease-in-out;
  transform: translateY(0%);
  animation-fill-mode: forwards;
  animation-delay: ${props => (props.delay ? props.delay : 0)}ms;
`

export const RotateInBottom = styled.div`
  animation-name: ${rotateInBottomKeyframes};
  animation-duration: ${props => (props.duration ? props.duration : 0)}ms;
  opacity: 0;
  transition: opacity ease-in-out, transform ease-in-out;
  transform: translateY(0%);
  animation-fill-mode: forwards;
  animation-delay: ${props => (props.delay ? props.delay : 0)}ms;
`

export const ZoomOut = styled.div`
  animation-name: ${zoomOutKeyframes};
  animation-duration: ${props => (props.duration ? props.duration : 0)}ms;
  transition: opacity ease-in-out, transform ease-in-out;
  animation-fill-mode: forwards;
  animation-delay: ${props => (props.delay ? props.delay : 0)}ms;
`
