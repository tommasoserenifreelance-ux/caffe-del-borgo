import { Composition } from "remotion";
import { CAFFE_DEL_BORGO_DURATION, CaffeDelBorgo } from "./CaffeDelBorgo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      // npx remotion render CaffeDelBorgo out/caffe-del-borgo.mp4
      id="CaffeDelBorgo"
      component={CaffeDelBorgo}
      durationInFrames={CAFFE_DEL_BORGO_DURATION}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
