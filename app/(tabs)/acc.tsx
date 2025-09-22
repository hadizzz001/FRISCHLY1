
import Catgrid from '@/components/Catgrid';
import MyCarousel from '@/components/MyCarousel';
import { ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <>
      <ScrollView>
        <MyCarousel />
        {/* <Products /> */}
         <Catgrid />
        {/*<Textslide /> 
        <Catgrid1 /> 
        <Carousel1 /> 
        <Catgrid2 />  
          <Footer /> */}
      </ScrollView>
    </>
  );
}


