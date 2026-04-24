import net from "net";
import dgram from "dgram";
import { afterEach, describe, expect, it, vi } from "vitest";

let occupiedServer: net.Server | null = null;
let occupiedUdpSocket: dgram.Socket | null = null;
let activeHandles: import("../src/server-l4.js").L4ServerHandles | null = null;

async function listen(server: net.Server, port: number) {
    await new Promise<void>((resolve, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", () => {
            server.off("error", reject);
            resolve();
        });
    });
}

async function closeServer(server: net.Server | null) {
    if (!server) return;
    await new Promise<void>((resolve) => server.close(() => resolve()));
}

async function bindUdp(socket: dgram.Socket, port: number) {
    await new Promise<void>((resolve, reject) => {
        socket.once("error", reject);
        socket.bind(port, "127.0.0.1", () => {
            socket.off("error", reject);
            resolve();
        });
    });
}

async function closeUdpSocket(socket: dgram.Socket | null) {
    if (!socket) return;
    await new Promise<void>((resolve) => socket.close(() => resolve()));
}

describe("startL4Servers", () => {
    afterEach(async () => {
        await activeHandles?.close();
        await closeServer(occupiedServer);
        await closeUdpSocket(occupiedUdpSocket);
        activeHandles = null;
        occupiedServer = null;
        occupiedUdpSocket = null;
        delete process.env.HOST;
        delete process.env.PORT_TCP;
        delete process.env.PORT_UDP;
        vi.resetModules();
        vi.doUnmock("../src/logger.js");
    });

    it("keeps startup alive when the TCP echo port is already in use", async () => {
        occupiedServer = net.createServer();
        await listen(occupiedServer, 0);
        const address = occupiedServer.address();
        expect(address).not.toBeNull();
        expect(typeof address).toBe("object");
        const occupiedPort = (address as net.AddressInfo).port;

        process.env.HOST = "127.0.0.1";
        process.env.PORT_TCP = String(occupiedPort);
        process.env.PORT_UDP = "0";

        const logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        };
        vi.doMock("../src/logger.js", () => ({ logger }));

        const { startL4Servers } = await import("../src/server-l4.js");
        activeHandles = startL4Servers();

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
                port: occupiedPort,
                protocol: "tcp",
                err: expect.objectContaining({ code: "EADDRINUSE" }),
            }),
            "TCP Echo server unavailable; port already in use"
        );
        expect(activeHandles?.getStatus().tcp).toBe(false);
        expect(logger.error).not.toHaveBeenCalled();
    });

    it("keeps shutdown responsive when the UDP echo port is already in use", async () => {
        occupiedUdpSocket = dgram.createSocket("udp4");
        await bindUdp(occupiedUdpSocket, 0);
        const address = occupiedUdpSocket.address();
        expect(typeof address).toBe("object");
        const occupiedPort = address.port;

        process.env.HOST = "127.0.0.1";
        process.env.PORT_TCP = "0";
        process.env.PORT_UDP = String(occupiedPort);

        const logger = {
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            debug: vi.fn(),
        };
        vi.doMock("../src/logger.js", () => ({ logger }));

        const { startL4Servers } = await import("../src/server-l4.js");
        activeHandles = startL4Servers();

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(logger.warn).toHaveBeenCalledWith(
            expect.objectContaining({
                port: occupiedPort,
                protocol: "udp",
                err: expect.objectContaining({ code: "EADDRINUSE" }),
            }),
            "UDP Echo server unavailable; port already in use"
        );
        expect(activeHandles?.getStatus().udp).toBe(false);

        await expect(activeHandles.close()).resolves.toBeUndefined();
        activeHandles = null;
        expect(logger.error).not.toHaveBeenCalled();
    });
});
