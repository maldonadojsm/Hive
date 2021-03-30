package com.example.hivemvp;

import static com.example.hivemvp.WebSocketConfiguration.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.hateoas.server.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RepositoryEventHandler(Physician.class)
public class EventHandler {

    private final SimpMessagingTemplate websocket;

    private final EntityLinks entityLinks;

    @Autowired
    public EventHandler(SimpMessagingTemplate websocket, EntityLinks entityLinks) {
        this.websocket = websocket;
        this.entityLinks = entityLinks;
    }

    @HandleAfterCreate
    public void newPhysician(Physician physician) {
        this.websocket.convertAndSend(MESSAGE_PREFIX + "/newPhysician", getPath(physician));
    }

    @HandleAfterDelete
    public void deletePhysician(Physician physician) {
        this.websocket.convertAndSend(MESSAGE_PREFIX + "/deletePhysician", getPath(physician));
    }

    @HandleAfterSave
    public void updatePhysician(Physician physician) {
        this.websocket.convertAndSend(MESSAGE_PREFIX + "/updatePhysician", getPath(physician));
    }

    private String getPath(Physician physician) {
        return this.entityLinks.linkForItemResource(physician.getClass(),
                physician.getId()).toUri().getPath();
    }


}
