# Architecture

```text
Video / CCTV source
        |
        v
Frame extraction -> Person detection -> Tracking
        |                 |              |
        +------ Density + movement -----+
                         |
                    Risk engine
                         |
              Dashboard / alerts / history
```

The web client is a typed React Query consumer. The API owns validation and risk-session state. PostgreSQL stores cameras and is the persistence boundary for future detection, risk-event, alert, and analysis-session records.

The initial application uses a replaceable simulated provider so the product can be reviewed without silently presenting fake results as model inference.