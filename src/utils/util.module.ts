import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { UtilService } from "./util.service";

@Module({
	providers: [UtilService],
	exports: [UtilService],
})
export class UtilModule implements NestModule {
	public configure(consumer: MiddlewareConsumer) {
		// consumer.apply(LoggerMiddleware).forRoutes(TeamsController);
	}
}