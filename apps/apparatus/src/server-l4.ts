import net from "net";
import dgram from "dgram";
import { logger } from "./logger.js";
import { cfg } from "./config.js";

function isPortInUseError(error: unknown): error is NodeJS.ErrnoException {
    return Boolean(error && typeof error === "object" && "code" in error && (error as NodeJS.ErrnoException).code === "EADDRINUSE");
}

function closeTcpServer(server: net.Server) {
    return new Promise<void>((resolve) => {
        if (!server.listening) {
            resolve();
            return;
        }
        server.close(() => resolve());
    });
}

function closeUdpSocket(socket: dgram.Socket, isBound: boolean) {
    return new Promise<void>((resolve) => {
        if (!isBound) {
            resolve();
            return;
        }
        try {
            socket.close(() => resolve());
        } catch {
            resolve();
        }
    });
}

export interface L4ServerHandles {
    close: () => Promise<void>;
    getStatus: () => { tcp: boolean; udp: boolean };
}

export function startL4Servers(): L4ServerHandles {
    let tcpServerBound = false;
    let udpServerBound = false;

    // TCP Echo Server
    const tcpServer = net.createServer((socket) => {
        logger.info({ remoteAddress: socket.remoteAddress, protocol: "tcp" }, "TCP connection established");
        socket.pipe(socket); // Echo back everything
        socket.on("error", (err) => logger.error({ err, protocol: "tcp" }, "TCP socket error"));
    });

    tcpServer.on("error", (err) => {
        if (isPortInUseError(err)) {
            logger.warn({ err, port: cfg.portTcp, protocol: "tcp" }, "TCP Echo server unavailable; port already in use");
            void closeTcpServer(tcpServer);
            return;
        }
        tcpServerBound = false;
        void closeTcpServer(tcpServer);
        logger.error({ err, port: cfg.portTcp, protocol: "tcp" }, "TCP Echo server failed");
    });

    tcpServer.listen(cfg.portTcp, cfg.host, () => {
        tcpServerBound = tcpServer.listening;
        logger.info({ port: cfg.portTcp, protocol: "tcp" }, "TCP Echo server listening");
    });

    tcpServer.on("close", () => {
        tcpServerBound = false;
    });

    // UDP Echo Server
    const udpServer = dgram.createSocket("udp4");

    udpServer.on("error", (err) => {
        if (isPortInUseError(err)) {
            const wasBound = udpServerBound;
            udpServerBound = false;
            logger.warn({ err, port: cfg.portUdp, protocol: "udp" }, "UDP Echo server unavailable; port already in use");
            void closeUdpSocket(udpServer, wasBound);
            return;
        }
        const wasBound = udpServerBound;
        udpServerBound = false;
        void closeUdpSocket(udpServer, wasBound);
        logger.error({ err, port: cfg.portUdp, protocol: "udp" }, "UDP Echo server failed");
    });

    udpServer.on("message", (msg, rinfo) => {
        logger.debug({ remoteAddress: rinfo.address, protocol: "udp" }, "UDP packet received");
        udpServer.send(msg, rinfo.port, rinfo.address, (err) => {
            if (err) logger.error({ err, protocol: "udp" }, "UDP send error");
        });
    });

    udpServer.on("listening", () => {
        udpServerBound = true;
        const address = udpServer.address();
        logger.info({ port: address.port, protocol: "udp" }, "UDP Echo server listening");
    });

    udpServer.on("close", () => {
        udpServerBound = false;
    });

    udpServer.bind(cfg.portUdp, cfg.host);

    return {
        close: async () => {
            await Promise.all([
                closeTcpServer(tcpServer),
                closeUdpSocket(udpServer, udpServerBound),
            ]);
        },
        getStatus: () => ({
            tcp: tcpServerBound,
            udp: udpServerBound,
        }),
    };
}
