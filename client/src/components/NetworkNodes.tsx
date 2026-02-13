'use client';

import { useRef, useEffect, useState } from 'react';

interface NetworkNodesProps {
    color?: string;
    nodeCount?: number;
    connectionDistance?: number;
    speed?: number;
}

const NetworkNodes = ({
    color = '#00ff41',
    nodeCount = 80,
    connectionDistance = 150,
    speed = 0.5
}: NetworkNodesProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
                setDimensions({ width: canvas.width, height: canvas.height });
            }
        };

        window.addEventListener('resize', resize);
        resize();

        // Node class to manage individual particles
        class Node {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;

            constructor(w: number, h: number) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * speed;
                this.vy = (Math.random() - 0.5) * speed;
                this.size = Math.random() * 2 + 1;
            }

            update(w: number, h: number) {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > w) this.vx *= -1;
                if (this.y < 0 || this.y > h) this.vy *= -1;
            }

            draw(context: CanvasRenderingContext2D) {
                context.beginPath();
                context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                context.fillStyle = color;
                context.fill();
            }
        }

        const nodes: Node[] = [];
        const initNodes = () => {
            nodes.length = 0;
            for (let i = 0; i < nodeCount; i++) {
                nodes.push(new Node(canvas.width, canvas.height));
            }
        };

        initNodes();

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < nodes.length; i++) {
                const nodeA = nodes[i];
                nodeA.update(canvas.width, canvas.height);
                nodeA.draw(ctx);

                // Check connections
                for (let j = i + 1; j < nodes.length; j++) {
                    const nodeB = nodes[j];
                    const dx = nodeA.x - nodeB.x;
                    const dy = nodeA.y - nodeB.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(nodeA.x, nodeA.y);
                        ctx.lineTo(nodeB.x, nodeB.y);
                        // Opacity based on distance
                        const opacity = 1 - distance / connectionDistance;
                        ctx.strokeStyle = `rgba(${parseInt(color.slice(1, 3), 16) || 0}, ${parseInt(color.slice(3, 5), 16) || 255}, ${parseInt(color.slice(5, 7), 16) || 65}, ${opacity * 0.2})`;
                        // Simpler stroke for performance
                        ctx.strokeStyle = color + Math.floor(opacity * 40).toString(16).padStart(2, '0');
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, nodeCount, connectionDistance, speed]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%', backgroundColor: '#05070a', overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
            {/* Subtle vignette for depth */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at center, transparent 0%, rgba(5, 7, 10, 0.4) 100%)',
                pointerEvents: 'none'
            }} />
        </div>
    );
};

export default NetworkNodes;
