package com.lanchat;

import android.app.Application;

import com.facebook.react.ReactApplication;
import fr.snapp.imagebase64.RNImgToBase64Package;
import fr.bamlab.rnimageresizer.ImageResizerPackage;
import com.peel.react.rnos.RNOSModule;
import com.imagepicker.ImagePickerPackage;
import com.peel.react.TcpSocketsModule;
import com.tradle.react.UdpSocketsModule;
import com.horcrux.svg.SvgPackage;
import com.pusherman.networkinfo.RNNetworkInfoPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import org.reactnative.camera.RNCameraPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNImgToBase64Package(),
            new ImageResizerPackage(),
            new RNOSModule(),
            new ImagePickerPackage(),
            new TcpSocketsModule(),
            new UdpSocketsModule(),
            new SvgPackage(),
            new RNNetworkInfoPackage(),
            new RandomBytesPackage(),
            new RNCameraPackage(),
            new RNDeviceInfo(),
            new VectorIconsPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }
}
