package com.mywork.webRTC.websocket.config;

import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

/**
 * This class contains message handler for in Signaling server
 * @author gautam
 * message handler to process the WebSocket messages that we'll receive from multiple clients.
 */
public class SocketHandler extends TextWebSocketHandler {
	
	List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
	
	
	/**
	 * filtering current socket session and sending message to all other
	 */
	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		// TODO Auto-generated method stub
		System.out.println(message.getPayload());
		for(WebSocketSession webSocketSession: sessions) {
			if(webSocketSession.isOpen() && !session.getId().equals(webSocketSession.getId())) {
				webSocketSession.sendMessage(message);
				System.out.println(message);
			}
		}
		
	}
	
	/**
	 * adding session to list
	 */	
	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		// TODO Auto-generated method stub
		sessions.add(session);
	}

}
