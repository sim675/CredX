"use client"

import Web3Scene from "./Web3Scene"

export default function Web3Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <Web3Scene />
      <div className="web3-bg">
        <div className="web3-grid" />
        <div className="web3-glow" />
      </div>
    </div>
  )
}

